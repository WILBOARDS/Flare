import { expect } from "chai";
import { ethers } from "hardhat";
import { CreatorToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CreatorToken", function () {
  let token: CreatorToken;
  let creator: HardhatEthersSigner;
  let fan: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  const MAX_SUPPLY = ethers.parseEther("10000000"); // 10M
  const INITIAL_MINT = ethers.parseEther("1000000"); // 1M
  const TOKEN_NAME = "Alice Coin";
  const TOKEN_SYMBOL = "ALICE";

  beforeEach(async function () {
    [creator, fan, other] = await ethers.getSigners();
    const CreatorToken = await ethers.getContractFactory("CreatorToken");
    token = await CreatorToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, creator.address);
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct token name and symbol", async function () {
      expect(await token.name()).to.equal(TOKEN_NAME);
      expect(await token.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("should have 18 decimals", async function () {
      expect(await token.decimals()).to.equal(18);
    });

    it("should mint 1M tokens to the creator on deployment", async function () {
      expect(await token.balanceOf(creator.address)).to.equal(INITIAL_MINT);
      expect(await token.totalSupply()).to.equal(INITIAL_MINT);
    });

    it("should set the correct max supply", async function () {
      expect(await token.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("should set the creator as owner", async function () {
      expect(await token.owner()).to.equal(creator.address);
      expect(await token.creator()).to.equal(creator.address);
    });

    it("should revert if creator is zero address", async function () {
      const CreatorToken = await ethers.getContractFactory("CreatorToken");
      // OZ Ownable v5 reverts with OwnableInvalidOwner before the constructor body runs
      await expect(
        CreatorToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(token, "OwnableInvalidOwner");
    });
  });

  describe("Minting", function () {
    it("should allow creator (owner) to mint tokens", async function () {
      const amount = ethers.parseEther("500");
      await token.connect(creator).mint(fan.address, amount);
      expect(await token.balanceOf(fan.address)).to.equal(amount);
    });

    it("should emit TokensMinted event", async function () {
      const amount = ethers.parseEther("500");
      await expect(token.connect(creator).mint(fan.address, amount))
        .to.emit(token, "TokensMinted")
        .withArgs(fan.address, amount);
    });

    it("should revert if non-creator tries to mint", async function () {
      await expect(token.connect(fan).mint(fan.address, ethers.parseEther("1")))
        .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("should revert if minting exceeds max supply", async function () {
      const remaining = MAX_SUPPLY - INITIAL_MINT;
      await expect(token.connect(creator).mint(fan.address, remaining + 1n))
        .to.be.revertedWith("CreatorToken: exceeds max supply");
    });

    it("should allow minting exactly up to max supply", async function () {
      const remaining = MAX_SUPPLY - INITIAL_MINT;
      await token.connect(creator).mint(fan.address, remaining);
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY);
    });

    it("should return correct remaining mintable supply", async function () {
      const expected = MAX_SUPPLY - INITIAL_MINT;
      expect(await token.remainingMintableSupply()).to.equal(expected);
    });
  });

  describe("Transfers", function () {
    it("should allow creator to send tokens to fans", async function () {
      const amount = ethers.parseEther("100");
      await token.connect(creator).transfer(fan.address, amount);
      expect(await token.balanceOf(fan.address)).to.equal(amount);
    });

    it("should allow fans to transfer tokens to each other", async function () {
      const amount = ethers.parseEther("100");
      await token.connect(creator).transfer(fan.address, amount);
      await token.connect(fan).transfer(other.address, ethers.parseEther("50"));
      expect(await token.balanceOf(other.address)).to.equal(ethers.parseEther("50"));
    });
  });

  describe("Multiple creator tokens", function () {
    it("should deploy independently with different names and symbols", async function () {
      const CreatorToken = await ethers.getContractFactory("CreatorToken");
      const token2 = await CreatorToken.deploy("Bob Coin", "BOB", fan.address);
      await token2.waitForDeployment();

      expect(await token.symbol()).to.equal("ALICE");
      expect(await token2.symbol()).to.equal("BOB");
      expect(await token.creator()).to.equal(creator.address);
      expect(await token2.creator()).to.equal(fan.address);
    });
  });
});
