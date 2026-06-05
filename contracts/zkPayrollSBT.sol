// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract zkPayrollSBT is ERC721, Ownable {

    // 🔑 Eligibility mapping
    mapping(address => bool) public eligible;

    // Track if appraisal already issued
    mapping(address => mapping(uint256 => bool)) public appraisalIssued;

    uint256 public nextTokenId;

    constructor() ERC721("zkPayroll Reputation", "ZKREP") {}

    // ✅ Set eligibility (called from CSV script / HR / DAO logic)
    function setEligible(address employee, bool status) external onlyOwner {
        eligible[employee] = status;
    }

    // ✅ Mint Soulbound appraisal token
    function mintAppraisal(address employee, uint256 year) external onlyOwner {
        require(eligible[employee], "Not eligible");
        require(!appraisalIssued[employee][year], "Already issued");

        _mint(employee, nextTokenId);
        appraisalIssued[employee][year] = true;
        nextTokenId++;
    }

    // 🚫 Block transfers (Soulbound)
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0) || to == address(0), "SBT: transfer blocked");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}

