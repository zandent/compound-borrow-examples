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

  // mint ceth
  amt = ethers.utils.parseEther("1000");
  console.log(`mint ceth ${amt}`);
  let tx = await CEther.mint({value: amt});
  await tx.wait();
  console.log(">> ✅ Done");

  // check balance
  balanceOf = await FaucetToken.balanceOf(contractAddress.MyContract);
  console.log(`MyContract pre-balance of FaucetToken ${balanceOf}`);
  balanceeth = await provider.getBalance(contractAddress.MyContract);
  console.log(`MyContract pre-balance of eth ${balanceeth}`);

  // lend to MyContract
  amt_to_suppply_div1e18 = "500000";
  amt_to_suppply = ethers.utils.parseEther(amt_to_suppply_div1e18);
  console.log(`Supply ${amt_to_suppply_div1e18} FaucetToken and borrow 0.002 eth ...`);
  tx = await MyContract.borrowEthExample(
    contractAddress.CEther,
    contractAddress.CErc20,
    contractAddress.FaucetToken,
    amt_to_suppply
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