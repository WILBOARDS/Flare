import { expect } from "chai";
import { ethers } from "hardhat";
import { FLCToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("FLCToken", function () {
  let flc: FLCToken;
  let owner: HardhatEthersSigner;
  let treasury: HardhatEthersSigner;
  let user: HardhatEthersSigner;

  const MAX_SUPPLY = ethers.parseEther("1000000000"); // 1B
  const INITIAL_MINT = ethers.parseEther("100000000"); // 100M

  beforeEach(async function () {
    [owner, treasury, user] = await ethers.getSigners();
    const FLCToken = await ethers.getContractFactory("FLCToken");
    flc = await FLCToken.deploy(owner.address);
    await flc.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the correct token name and symbol", async function () {
      expect(await flc.name()).to.equal("Flare Coin");
      expect(await flc.symbol()).to.equal("FLC");
    });

    it("should have 18 decimals", async function () {
      expect(await flc.decimals()).to.equal(18);
    });

    it("should mint 100M tokens to the owner on deployment", async function () {
      expect(await flc.balanceOf(owner.address)).to.equal(INITIAL_MINT);
      expect(await flc.totalSupply()).to.equal(INITIAL_MINT);
    });

    it("should set the correct max supply", async function () {
      expect(await flc.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("should set the correct owner", async function () {
      expect(await flc.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("should allow owner to mint tokens", async function () {
      const amount = ethers.parseEther("1000");
      await flc.mint(user.address, amount);
      expect(await flc.balanceOf(user.address)).to.equal(amount);
    });

    it("should emit TokensMinted event on mint", async function () {
      const amount = ethers.parseEther("1000");
      await expect(flc.mint(user.address, amount))
        .to.emit(flc, "TokensMinted")
        .withArgs(user.address, amount);
    });

    it("should revert if non-owner tries to mint", async function () {
      await expect(flc.connect(user).mint(user.address, ethers.parseEther("1")))
        .to.be.revertedWithCustomError(flc, "OwnableUnauthorizedAccount");
    });

    it("should revert if minting would exceed max supply", async function () {
      const remaining = MAX_SUPPLY - INITIAL_MINT;
      // Try to mint 1 token more than remaining
      await expect(flc.mint(user.address, remaining + 1n))
        .to.be.revertedWith("FLC: exceeds max supply");
    });

    it("should allow minting exactly up to max supply", async function () {
      const remaining = MAX_SUPPLY - INITIAL_MINT;
      await flc.mint(user.address, remaining);
      expect(await flc.totalSupply()).to.equal(MAX_SUPPLY);
    });

    it("should return correct remaining mintable supply", async function () {
      const expected = MAX_SUPPLY - INITIAL_MINT;
      expect(await flc.remainingMintableSupply()).to.equal(expected);
    });
  });

  describe("Burning", function () {
    it("should allow token holders to burn their tokens", async function () {
      const burnAmount = ethers.parseEther("1000");
      await flc.burn(burnAmount);
      expect(await flc.balanceOf(owner.address)).to.equal(INITIAL_MINT - burnAmount);
      expect(await flc.totalSupply()).to.equal(INITIAL_MINT - burnAmount);
    });

    it("should allow burning via burnFrom with approval", async function () {
      const burnAmount = ethers.parseEther("500");
      await flc.transfer(user.address, burnAmount);
      await flc.connect(user).approve(owner.address, burnAmount);
      await flc.burnFrom(user.address, burnAmount);
      expect(await flc.balanceOf(user.address)).to.equal(0);
    });

    it("should revert burn if amount exceeds balance", async function () {
      await expect(flc.connect(user).burn(ethers.parseEther("1")))
        .to.be.revertedWithCustomError(flc, "ERC20InsufficientBalance");
    });
  });

  describe("Transfers", function () {
    it("should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("5000");
      await flc.transfer(user.address, amount);
      expect(await flc.balanceOf(user.address)).to.equal(amount);
      expect(await flc.balanceOf(owner.address)).to.equal(INITIAL_MINT - amount);
    });
  });

  describe("Ownership", function () {
    it("should transfer ownership", async function () {
      await flc.transferOwnership(treasury.address);
      expect(await flc.owner()).to.equal(treasury.address);
    });

    it("should allow new owner to mint after transfer", async function () {
      await flc.transferOwnership(treasury.address);
      const amount = ethers.parseEther("1000");
      await flc.connect(treasury).mint(user.address, amount);
      expect(await flc.balanceOf(user.address)).to.equal(amount);
    });
  });
});
