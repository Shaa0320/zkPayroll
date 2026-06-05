// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PayRaiseDAO.sol";

contract zkPayrollSBT is ERC721, Ownable {

    // 🔑 Eligibility mapping
    mapping(address => bool) public eligible;

    // Track appraisal issuance per year
    mapping(address => mapping(uint256 => bool)) public appraisalIssued;
PayRaiseDAO public dao;

    uint256 public nextTokenId;

    constructor(address initialOwner, address daoAddress)
    ERC721("zkPayroll Reputation", "ZKREP")
    Ownable(initialOwner)
{
    dao = PayRaiseDAO(daoAddress);
}


    // ✅ Set eligibility (CSV / HR / DAO logic)
    function setEligible(address employee, bool status) external onlyOwner {
        eligible[employee] = status;
    }

    // ✅ Mint Soulbound appraisal token
    function mintAppraisal(address employee, uint256 year) external onlyOwner {
        require(dao.isApproved(year), "DAO not approved");
        require(eligible[employee], "Not eligible");
        require(!appraisalIssued[employee][year], "Already issued");

        _mint(employee, nextTokenId);
        appraisalIssued[employee][year] = true;
        nextTokenId++;
    }

    // 🚫 Soulbound enforcement (OZ v5 way)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {

        address from = super._update(to, tokenId, auth);

        // Block transfers (allow mint & burn only)
        if (from != address(0) && to != address(0)) {
            revert("SBT: transfer blocked");
        }

        return from;
    }
}
