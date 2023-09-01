const fs = require('fs');
const { network } = require('hardhat');
// contract addresses
let contractAddress;

try {
  contractAddress = require(__dirname +
    `/../contractAddress.json`);
} catch (e) {
  contractAddress = {};
}
function printContractAddress() {
  fs.writeFileSync(
    __dirname + `/../contractAddress.json`,
    JSON.stringify(contractAddress, null, '\t'),
  );
}
async function main() {
  const [deployer] = await ethers.getSigners();
  const provider = ethers.getDefaultProvider(network.config.url);

  console.log("Account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  
  const MyContract = await ethers.getContractAt("MyContract", contractAddress.MyContract, deployer);
  const CEther = await ethers.getContractAt("contracts/CEther.sol:CEther", contractAddress.CEther, deployer);
  console.log(">> Found CEther at:", CEther.address);
  FaucetToken = await ethers.getContractAt("FaucetToken", contractAddress.FaucetToken, deployer);

  borrowBalanceStored = await CEther.borrowBalanceStored(contractAddress.MyContract);
  // console.log(`Current ETH borrow amount ${borrowBalanceStored}`);

  // // transfer eth
  // console.log(`Transfer more ${borrowBalanceStored} eth to MyContract ...`);
  // let tx = await deployer.sendTransaction({to:contractAddress.MyContract, value: borrowBalanceStored});
  // await tx.wait();
  // console.log(">> ✅ Done");

  // check balance
  balanceOf = await FaucetToken.balanceOf(contractAddress.MyContract);
  console.log(`MyContract pre-balance of FaucetToken ${balanceOf}`);
  balanceeth = await provider.getBalance(contractAddress.MyContract);
  console.log(`MyContract pre-balance of eth ${balanceeth}`);

  // repay from MyContract
  console.log(`Repay ${borrowBalanceStored} eth to ceth ...`);
  tx = await MyContract.myEthRepayBorrow(
    contractAddress.CEther,
    borrowBalanceStored,
    300000
  );
  await tx.wait();
  console.log(">> ✅ Done");
  // check balance
  balanceOf = await FaucetToken.balanceOf(contractAddress.MyContract);
  console.log(`MyContract post-balance of FaucetToken ${balanceOf}`);
  balanceeth = await provider.getBalance(contractAddress.MyContract);
  console.log(`MyContract post-balance of eth ${balanceeth}`);
  borrowBalanceStored = await CEther.borrowBalanceStored(contractAddress.MyContract);
  console.log(`Current ETH borrow amount ${borrowBalanceStored}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });