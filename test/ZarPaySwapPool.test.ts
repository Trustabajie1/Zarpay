import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";describe("ZarPaySwapPool", function () {
  async function deployFixture() {
    const [admin, user, merchant, feeRecipient] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USD Coin", "USDC");
    const eurc = await MockERC20.deploy("Euro Coin", "EURC");

    // Rate: 1 USDC = 0.92 EURC, scaled by 1_000_000 to match the contract's math
    const initialRate = 920_000n;
    const maxSwapAmount = ethers.parseUnits("10000", 6);
    const feeBps = 50n; // 0.5%

    const Pool = await ethers.getContractFactory("ZarPaySwapPool");
    const pool = await Pool.deploy(
      await usdc.getAddress(),
      await eurc.getAddress(),
      initialRate,
      maxSwapAmount,
      feeBps,
      feeRecipient.address
    );

    // Seed the pool with liquidity so swaps have something to draw from
    const seedAmount = ethers.parseUnits("100000", 6);
    await usdc.mint(admin.address, seedAmount);
    await eurc.mint(admin.address, seedAmount);
    await usdc.connect(admin).approve(await pool.getAddress(), seedAmount);
    await eurc.connect(admin).approve(await pool.getAddress(), seedAmount);
    await pool.connect(admin).addLiquidity(await usdc.getAddress(), seedAmount);
    await pool.connect(admin).addLiquidity(await eurc.getAddress(), seedAmount);

    // Give the test user some USDC and approve the pool to pull it
    const userAmount = ethers.parseUnits("1000", 6);
    await usdc.mint(user.address, userAmount);
    await usdc.connect(user).approve(await pool.getAddress(), userAmount);

    return { pool, usdc, eurc, admin, user, merchant, feeRecipient, initialRate, feeBps };
  }

  describe("swapUSDCtoEURC", function () {
    it("swaps at the current rate minus fee", async function () {
      const { pool, eurc, user } = await loadFixture(deployFixture);
      const amountIn = ethers.parseUnits("100", 6);

      const [expectedNet] = await pool.previewSwapAfterFee(amountIn, true);
      await pool.connect(user).swapUSDCtoEURC(amountIn, expectedNet);

      expect(await eurc.balanceOf(user.address)).to.equal(expectedNet);
    });

    it("reverts when minAmountOut is not met (slippage protection)", async function () {
      const { pool, user } = await loadFixture(deployFixture);
      const amountIn = ethers.parseUnits("100", 6);

      const [expectedNet] = await pool.previewSwapAfterFee(amountIn, true);
      const unrealisticMin = expectedNet + 1n; // demand more than the swap can give

      await expect(
        pool.connect(user).swapUSDCtoEURC(amountIn, unrealisticMin)
      ).to.be.revertedWith("slippage: amountOut below minimum");
    });

    it("reverts above maxSwapAmount", async function () {
      const { pool, user, usdc, admin } = await loadFixture(deployFixture);
      const tooMuch = ethers.parseUnits("20000", 6);
      await usdc.mint(user.address, tooMuch);
      await usdc.connect(user).approve(await pool.getAddress(), tooMuch);

      await expect(
        pool.connect(user).swapUSDCtoEURC(tooMuch, 0)
      ).to.be.revertedWith("exceeds max swap amount");
    });
  });

  describe("payMerchant", function () {
    it("sends EURC to the merchant, not the payer", async function () {
      const { pool, eurc, user, merchant } = await loadFixture(deployFixture);
      const amountIn = ethers.parseUnits("50", 6);
      const [expectedNet] = await pool.previewSwapAfterFee(amountIn, true);

      await pool.connect(user).payMerchant(merchant.address, amountIn, expectedNet);

      expect(await eurc.balanceOf(merchant.address)).to.equal(expectedNet);
      expect(await eurc.balanceOf(user.address)).to.equal(0);
    });
  });

  describe("access control", function () {
    it("blocks non-admin from updating the rate", async function () {
      const { pool, user } = await loadFixture(deployFixture);
      await expect(pool.connect(user).updateRate(1_000_000)).to.be.reverted;
    });

    it("blocks fee from ever exceeding the hard cap", async function () {
      const { pool, admin } = await loadFixture(deployFixture);
      await expect(pool.connect(admin).updateFeeBps(501)).to.be.revertedWith("fee too high");
    });
  });

  describe("pause", function () {
    it("blocks swaps while paused", async function () {
      const { pool, admin, user } = await loadFixture(deployFixture);
      await pool.connect(admin).pause();

      await expect(
  pool.connect(user).swapUSDCtoEURC(ethers.parseUnits("10", 6), 0)
).to.be.revertedWith("Pausable: paused");
    });
  });
});