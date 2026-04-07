// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CreatorToken.sol";

/**
 * @title CreatorTokenFactory
 * @dev Factory contract for deploying per-creator ERC-20 tokens on the FLAIR platform.
 *
 * - Only the platform owner (admin backend wallet) can deploy creator tokens
 * - Each creator address can only have one token (enforced by mapping)
 * - Emits CreatorTokenDeployed event on each deployment for easy indexing
 */
contract CreatorTokenFactory is Ownable {
    /// @dev creator wallet address => deployed token address
    mapping(address => address) public creatorToToken;

    /// @dev All deployed creator token addresses in order
    address[] public allTokens;

    event CreatorTokenDeployed(
        address indexed creator,
        address indexed tokenAddress,
        string name,
        string symbol
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deploy a new CreatorToken for a given creator.
     * @param name Token name (e.g., "Alice Coin")
     * @param symbol Token symbol (e.g., "ALICE")
     * @param creator The creator's wallet address (will receive ownership and initial supply)
     * @return tokenAddress The address of the newly deployed CreatorToken
     */
    function deployCreatorToken(
        string memory name,
        string memory symbol,
        address creator
    ) external onlyOwner returns (address tokenAddress) {
        require(creator != address(0), "Factory: zero creator address");
        require(creatorToToken[creator] == address(0), "Factory: creator already has a token");
        require(bytes(name).length > 0, "Factory: empty token name");
        require(bytes(symbol).length > 0, "Factory: empty token symbol");

        CreatorToken token = new CreatorToken(name, symbol, creator);
        tokenAddress = address(token);

        creatorToToken[creator] = tokenAddress;
        allTokens.push(tokenAddress);

        emit CreatorTokenDeployed(creator, tokenAddress, name, symbol);
    }

    /**
     * @dev Returns the total number of creator tokens deployed.
     */
    function totalTokens() external view returns (uint256) {
        return allTokens.length;
    }

    /**
     * @dev Returns the token address for a given creator, or address(0) if none.
     */
    function getTokenForCreator(address creator) external view returns (address) {
        return creatorToToken[creator];
    }
}
