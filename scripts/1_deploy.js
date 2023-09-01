const fs = require('fs');
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

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const MyContract = await ethers.getContractFactory("MyContract");
  const myContract = await MyContract.deploy();
  await myContract.deployed();
  contractAddress.MyContract = myContract.address.toLowerCase();
  console.log(">> ✅ MyContract address:", contractAddress.MyContract);

  const FaucetToken = await ethers.getContractFactory("FaucetToken");
  const faucetToken = await FaucetToken.deploy("TESTTOKEN", "TEST", 18);
  await faucetToken.deployed();
  contractAddress.FaucetToken = faucetToken.address.toLowerCase();
  console.log(">> ✅ FaucetToken address:", contractAddress.FaucetToken);
  printContractAddress();
  await mintFaucetToken(ethers.utils.parseEther("1000000"), deployer);
  await deployCErc20(deployer);
  await deployCEther(deployer);
}
async function mintFaucetToken(amt, deployer) {
  FaucetToken = await ethers.getContractAt("FaucetToken", contractAddress.FaucetToken, deployer);
  console.log("Found FaucetToken at:", FaucetToken.address);
  console.log(`mint FaucetToken ${amt}`);
  let tx = await FaucetToken.mint(contractAddress.MyContract, amt);
  await tx.wait();
  console.log(">> ✅ Done");
  let balanceOf = await FaucetToken.balanceOf(contractAddress.MyContract);
  console.log(`MyContract balance of FaucetToken ${balanceOf}`);
}
async function deployCErc20(deployer) {
  const CErc20 = await ethers.getContractFactory("contracts/CErc20.sol:CErc20");
  const cErc20 = await CErc20.deploy(
    contractAddress.FaucetToken,
    ethers.utils.parseEther("200000000"),
    `cTESTTOKEN`,
    `cTEST`,
    18,
    deployer.address
  );
  await cErc20.deployed();
  contractAddress.CErc20 = cErc20.address.toLowerCase();
  console.log(">> ✅ CErc20 address:", contractAddress.CErc20);
  printContractAddress();
}
async function deployCEther(deployer) {
  const CEther = await ethers.getContractFactory("contracts/CEther.sol:CEther");
  const cEther = await CEther.deploy(
    ethers.utils.parseEther("200000000"),
    `cethereum`,
    `ceth`,
    18,
    deployer.address
  );
  await cEther.deployed();
  contractAddress.CEther = cEther.address.toLowerCase();
  console.log(">> ✅ CEther address:", contractAddress.CEther);
  printContractAddress();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });