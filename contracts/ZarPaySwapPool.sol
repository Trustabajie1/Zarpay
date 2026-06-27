// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ZarPaySwapPool is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant RATE_UPDATER_ROLE = keccak256("RATE_UPDATER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    IERC20 public immutable usdc;
    IERC20 public immutable eurc;

    uint256 public usdcToEurcRate;
    uint256 public maxSwapAmount;

    // Fee taken on every swap, in basis points (1 bps = 0.01%). 50 = 0.5%.
    uint256 public feeBps;
    uint256 public constant MAX_FEE_BPS = 500; // hard cap: fee can never exceed 5%
    address public feeRecipient;

    event RateUpdated(uint256 oldRate, uint256 newRate);
    event MaxSwapAmountUpdated(uint256 oldMax, uint256 newMax);
    event FeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event Swapped(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeAmount
    );
    event MerchantPaid(
        address indexed payer,
        address indexed merchant,
        uint256 usdcAmountIn,
        uint256 eurcAmountOut,
        uint256 feeAmount
    );
    event LiquidityAdded(address indexed token, uint256 amount);
    event LiquidityRemoved(address indexed token, uint256 amount, address to);

    constructor(
        address _usdc,
        address _eurc,
        uint256 _initialRate,
        uint256 _maxSwapAmount,
        uint256 _initialFeeBps,
        address _feeRecipient
    ) {
        require(_usdc != address(0) && _eurc != address(0), "zero token address");
        require(_initialRate > 0, "rate must be > 0");
        require(_initialFeeBps <= MAX_FEE_BPS, "fee too high");
        require(_feeRecipient != address(0), "zero fee recipient");

        usdc = IERC20(_usdc);
        eurc = IERC20(_eurc);
        usdcToEurcRate = _initialRate;
        maxSwapAmount = _maxSwapAmount;
        feeBps = _initialFeeBps;
        feeRecipient = _feeRecipient;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RATE_UPDATER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
    }

    function swapUSDCtoEURC(uint256 amountIn) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        amountOut = _swap(usdc, eurc, amountIn, msg.sender, msg.sender, true);
    }

    function swapEURCtoUSDC(uint256 amountIn) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        amountOut = _swap(eurc, usdc, amountIn, msg.sender, msg.sender, false);
    }

    function payMerchant(address merchant, uint256 usdcAmountIn)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 eurcAmountOut)
    {
        require(merchant != address(0), "invalid merchant address");
        uint256 feeAmount;
        (eurcAmountOut, feeAmount) = _swapWithFee(usdc, eurc, usdcAmountIn, msg.sender, merchant, true);
        emit MerchantPaid(msg.sender, merchant, usdcAmountIn, eurcAmountOut, feeAmount);
    }

    function _swap(
        IERC20 tokenIn,
        IERC20 tokenOut,
        uint256 amountIn,
        address from,
        address to,
        bool isUsdcToEurc
    ) internal returns (uint256 amountOut) {
        uint256 feeAmount;
        (amountOut, feeAmount) = _swapWithFee(tokenIn, tokenOut, amountIn, from, to, isUsdcToEurc);
        emit Swapped(from, address(tokenIn), address(tokenOut), amountIn, amountOut, feeAmount);
    }

    function _swapWithFee(
        IERC20 tokenIn,
        IERC20 tokenOut,
        uint256 amountIn,
        address from,
        address to,
        bool isUsdcToEurc
    ) internal returns (uint256 amountOut, uint256 feeAmount) {
        require(amountIn > 0, "amount must be > 0");
        require(maxSwapAmount == 0 || amountIn <= maxSwapAmount, "exceeds max swap amount");

        uint256 grossOut = previewSwap(amountIn, isUsdcToEurc);
        require(grossOut > 0, "quoted output is zero");

        feeAmount = (grossOut * feeBps) / 10_000;
        amountOut = grossOut - feeAmount;

        require(tokenOut.balanceOf(address(this)) >= grossOut, "insufficient pool reserves");

        // Pull input token from the user (requires prior approve()/Permit2 allowance)
        tokenIn.safeTransferFrom(from, address(this), amountIn);

        // Push converted amount (minus fee) to recipient
        tokenOut.safeTransfer(to, amountOut);

        // Push fee straight to the fee recipient, automatically, every swap
        if (feeAmount > 0) {
            tokenOut.safeTransfer(feeRecipient, feeAmount);
        }
    }

    /// @notice Preview the GROSS output (before fee) for a given input, at the current rate.
    function previewSwap(uint256 amountIn, bool isUsdcToEurc) public view returns (uint256) {
        if (isUsdcToEurc) {
            return (amountIn * usdcToEurcRate) / 1_000_000;
        } else {
            return (amountIn * 1_000_000) / usdcToEurcRate;
        }
    }

    /// @notice Preview the NET output (after fee) — use this for the UI's "Estimated Receive".
    function previewSwapAfterFee(uint256 amountIn, bool isUsdcToEurc) external view returns (uint256 netOut, uint256 feeAmount) {
        uint256 grossOut = previewSwap(amountIn, isUsdcToEurc);
        feeAmount = (grossOut * feeBps) / 10_000;
        netOut = grossOut - feeAmount;
    }

    function updateRate(uint256 newRate) external onlyRole(RATE_UPDATER_ROLE) {
        require(newRate > 0, "rate must be > 0");
        uint256 old = usdcToEurcRate;
        usdcToEurcRate = newRate;
        emit RateUpdated(old, newRate);
    }

    function updateMaxSwapAmount(uint256 newMax) external onlyRole(RATE_UPDATER_ROLE) {
        uint256 old = maxSwapAmount;
        maxSwapAmount = newMax;
        emit MaxSwapAmountUpdated(old, newMax);
    }

    function updateFeeBps(uint256 newFeeBps) external onlyRole(FEE_MANAGER_ROLE) {
        require(newFeeBps <= MAX_FEE_BPS, "fee too high");
        uint256 old = feeBps;
        feeBps = newFeeBps;
        emit FeeUpdated(old, newFeeBps);
    }

    function updateFeeRecipient(address newRecipient) external onlyRole(FEE_MANAGER_ROLE) {
        require(newRecipient != address(0), "zero recipient");
        address old = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(old, newRecipient);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function addLiquidity(IERC20 token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token == usdc || token == eurc, "unsupported token");
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit LiquidityAdded(address(token), amount);
    }

    function removeLiquidity(IERC20 token, uint256 amount, address to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token == usdc || token == eurc, "unsupported token");
        require(to != address(0), "zero recipient");
        token.safeTransfer(to, amount);
        emit LiquidityRemoved(address(token), amount, to);
    }

    function getReserves() external view returns (uint256 usdcReserve, uint256 eurcReserve) {
        usdcReserve = usdc.balanceOf(address(this));
        eurcReserve = eurc.balanceOf(address(this));
    }
}