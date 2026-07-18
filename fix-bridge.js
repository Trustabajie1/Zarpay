const fs = require('fs');
let c = fs.readFileSync('components/SendModal.tsx', 'utf8');

c = c.replace(
  'const hash = await writeContractAsync({',
  'const hash = await writeContractAsync({'
);

// Add as any to writeContractAsync call
c = c.replace(
  '      const hash = await writeContractAsync({\n' +
  '        address: tokenAddress as `0x${string}`,\n' +
  '        abi: usdcAbi,\n' +
  '        functionName: "transfer",\n' +
  '        args: [toAddress as `0x${string}`, parseUnits(amount, USDC_DECIMALS)],\n' +
  '      });',
  '      const hash = await writeContractAsync({\n' +
  '        address: tokenAddress as `0x${string}`,\n' +
  '        abi: usdcAbi,\n' +
  '        functionName: "transfer",\n' +
  '        args: [toAddress as `0x${string}`, parseUnits(amount, USDC_DECIMALS)],\n' +
  '      } as any);'
);

fs.writeFileSync('components/SendModal.tsx', c);
console.log('Fixed SendModal.');