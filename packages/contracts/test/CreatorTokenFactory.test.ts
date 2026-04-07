import { expect } from "chai";
import { ethers } from "hardhat";
import { CreatorTokenFactory, CreatorToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CreatorTokenFactory", function () {
  let factory: CreatorTokenFactory;
  let owner: HardhatEthersSigner;
  let creator1: HardhatEthersSigner;
  let creator2: HardhatEthersSigner;
  let nonOwner: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, creator1, creator2, nonOwner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CreatorTokenFactory");
    factory = await Factory.deploy();
    await factory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the deployer as owner", async function () {
      expect(await factory.owner()).to.equal(owner.address);
    });

    it("should start with zero tokens deployed", async function () {
      expect(await factory.totalTokens()).to.equal(0);
    });
  });

  describe("deployCreatorToken", function () {
    it("should deploy a creator token and emit event", async function () {
      const tx = await factory.deployCreatorToken("Alice Coin", "ALICE", creator1.address);
      const receipt = await tx.wait();

      await expect(tx)
        .to.emit(factory, "CreatorTokenDeployed")
        .withArgs(creator1.address, await factory.creatorToToken(creator1.address), "Alice Coin", "ALICE");
    });

    it("should store the token address in creatorToToken mapping", async function () {
      await factory.deployCreatorToken("Alice Coin", "ALICE", creator1.address);
      const tokenAddress = await factory.creatorToToken(creator1.address);
      expect(tokenAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should add token to allTokens array", async function () {
      await factory.deployCreatorToken("Alice Coin", "ALICE", creator1.address);
      expect(await factory.totalTokens()).to.equal(1);
      const tokenAddress = await factory.allTokens(0);
      expect(tokenAddress).to.equal(await factory.creatorToToken(creator1.address));
    });

    it("should deploy token with correct name and symbol", async function () {
      await factory.deployCreatorToken("Alice Coin", "ALICE", creator1.address);
      const tokenAddress = await factory.creatorToToken(creator1.address);
      const token = await ethers.getContractAt("CreatorToken", tokenAddress) as CreatorToken;

      expect(await token.name()).to.equal("Alice Coin");
      expect(await token.symbol()).to.equal("ALICE");
    });

    it("should mint 1M initial tokens to the creator", async function () {
      await factory.deployCreatorToken("Alice Coin", "ALICE", creator1.address);
      const tokenAddress = await factory.creatorToToken(creator1.address);
      const token = await ethers.getContractAt("CreatorToken", tokenAddress) as CreatorToken;

      expect(await token.balanceOf(creator1.address)).to.equal(ethers.parseEther("1000000"));
    });

    it("should set the creator as the token owner", async function () {
      await factory.deployCreatorToken("Alice Coin", "ALICE", creator1.address);
      const tokenAddress = await factory.creatorToToken(creator1.address);
      const token = await ethers.getContractAt("CreatorToken", tokenAddress) as CreatorToken;

      expect(await token.owner()).to.equal(creator1.address);
    });

    it("should revert if non-owner tries to deploy", async function () {
      await expect(
        factory.connect(nonOwner).deployCreatorToken("Alice Coin", "ALICE", creator1.address)
      ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
    });

    it("should revert if creator already has a token", async function () {
      await factory.deployCreatorToken("Alice Coin", "ALICE", creator1.address);
      await expect(
        factory.deployCreatorToken("Alice Coin 2", "ALICE2", creator1.address)
      ).to.be.revertedWith("Factory: creator already has a token");
    });

    it("should revert if creator address is zero", async function () {
      await expect(
        factory.deployCreatorToken("Alice Coin", "ALICE", ethers.ZeroAddress)
      ).to.be.revertedWith("Factory: zero creator address");
    });

    it("should revert if name is empty", async function () {
      await expect(
        factory.deployCreatorToken("", "ALICE", creator1.address)
      ).to.be.revertedWith("Factory: empty token name");
    });

    it("should revert if symbol is empty", async function () {
      await expect(
        factory.deployCreatorToken("Alice Coin", "", creator1.address)
      ).to.be.revertedWith("Factory: empty token symbol");
    });

    it("should handle multiple creator token deployments", async function () {
      await factory.deployCreatorToken("Alice Coin", "ALICE", creator1.address);
      await factory.deployCreatorToken("Bob Coin", "BOB", creator2.address);

      expect(await factory.totalTokens()).to.equal(2);

      const aliceTokenAddr = await factory.creatorToToken(creator1.address);
      const bobTokenAddr = await factory.creatorToToken(creator2.address);
      expect(aliceTokenAddr).to.not.equal(bobTokenAddr);
    });
  });

  describe("getTokenForCreator", function () {
    it("should return zero address for creator without a token", async function () {
      expect(await factory.getTokenForCreator(creator1.address)).to.equal(ethers.ZeroAddress);
    });

    it("should return the correct token address after deployment", async function () {
      await factory.deployCreatorToken("Alice Coin", "ALICE", creator1.address);
      const fromMapping = await factory.creatorToToken(creator1.address);
      const fromHelper = await factory.getTokenForCreator(creator1.address);
      expect(fromMapping).to.equal(fromHelper);
    });
  });
});
