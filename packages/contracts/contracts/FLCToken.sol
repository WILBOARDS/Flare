// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FLCToken
 * @dev FLAIR (FLC) — the platform utility token for the FLAIR Web3 SocialFi platform.
 *
 * Token details:
 *   Name:        FLAIR
 *   Symbol:      FLC
 *   Decimals:    18
 *   Max supply:  1,000,000,000 FLC (1 billion)
 *   Init mint:   100,000,000 FLC  (100 million) → treasury/owner
 *
 * Features:
 *   - ERC-20 compliant
 *   - Burnable by any holder (deflationary mechanism)
 *   - ERC-2612 permit (gasless approvals)
 *   - Owner-controlled minting up to MAX_SUPPLY (for rewards, airdrops)
 *   - Governance voting weight helper (quadratic weighting)
 *   - On-chain reward claim tracking for backend integration
 *
 * Deployment: Polygon (Amoy testnet / Mainnet)
 */
contract FLCToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    // ─── State ────────────────────────────────────────────────────────────────

    /// @dev Total FLC ever distributed as platform rewards
    uint256 public totalRewardsDistributed;

    /// @dev Per-address lifetime reward claims (for off-chain analytics)
    mapping(address => uint256) public lifetimeRewardsClaimed;

    // ─── Events ───────────────────────────────────────────────────────────────

    event TokensMinted(address indexed to, uint256 amount);
    event RewardDistributed(address indexed to, uint256 amount, string reason);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address initialOwner)
        ERC20("FLAIR", "FLC")
        ERC20Permit("FLAIR")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 100_000_000 * 10 ** 18);
    }

    // ─── Owner functions ──────────────────────────────────────────────────────

    /**
     * @dev Mint new FLC tokens. Only callable by owner (platform treasury).
     * @param to       Recipient address
     * @param amount   Amount to mint (18-decimal units)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "FLC: exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Distribute FLC as a platform reward (engagement, tips, creator bonuses).
     *      Emits RewardDistributed so the backend can index reward history on-chain.
     * @param to      Recipient
     * @param amount  Amount in 18-decimal units
     * @param reason  Human-readable reason tag (e.g. "post_like", "creator_bonus")
     */
    function distributeReward(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "FLC: exceeds max supply");
        _mint(to, amount);
        totalRewardsDistributed += amount;
        lifetimeRewardsClaimed[to] += amount;
        emit RewardDistributed(to, amount, reason);
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    /**
     * @dev Remaining mintable supply.
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @dev Quadratic voting weight for governance (sqrt of balance, 18-decimal).
     *      Front-end can call this to display a user's effective vote weight.
     * @param account  Address to query
     */
    function votingWeight(address account) external view returns (uint256) {
        return _sqrt(balanceOf(account));
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    /// @dev Integer square root (Babylonian method).
    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
