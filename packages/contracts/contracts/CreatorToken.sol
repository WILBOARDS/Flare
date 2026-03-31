// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CreatorToken
 * @dev Per-creator ERC-20 token on the FLAIR platform.
 *
 * - Max supply: 10,000,000 tokens per creator
 * - Initial mint: 1,000,000 tokens to the creator on deployment
 * - Creator (owner) can mint additional tokens up to the max supply
 * - Deployed by CreatorTokenFactory — factory transfers ownership to the creator
 */
contract CreatorToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18;

    /// @dev The creator's wallet address (immutable after deployment)
    address public immutable creator;

    event TokensMinted(address indexed to, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        address _creator
    ) ERC20(name, symbol) Ownable(_creator) {
        // Note: Ownable(_creator) already reverts with OwnableInvalidOwner if _creator is address(0)
        creator = _creator;
        _mint(_creator, 1_000_000 * 10 ** 18);
    }

    /**
     * @dev Mint additional creator tokens. Only callable by the creator (owner).
     * @param to Recipient address
     * @param amount Amount to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "CreatorToken: exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Returns remaining mintable supply for this creator token.
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
