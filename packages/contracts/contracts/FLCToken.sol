// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FLCToken
 * @dev Flare Coin (FLC) — the platform utility token for the FLAIR social media platform.
 *
 * - Max supply: 1,000,000,000 FLC (1 billion)
 * - Initial mint: 100,000,000 FLC (100 million) to the treasury/owner
 * - Owner can mint additional tokens up to the max supply (for rewards, airdrops)
 * - Burnable by any token holder
 */
contract FLCToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    event TokensMinted(address indexed to, uint256 amount);

    constructor(address initialOwner)
        ERC20("Flare Coin", "FLC")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 100_000_000 * 10 ** 18);
    }

    /**
     * @dev Mint new tokens. Only callable by owner (platform treasury).
     * @param to Recipient address
     * @param amount Amount to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "FLC: exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Returns remaining mintable supply.
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
