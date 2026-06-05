// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PayRaiseDAO {
    mapping(address => bool) public voters;
    mapping(uint256 => uint256) public yesVotes;
    mapping(uint256 => bool) public approved;

    uint256 public voteThreshold = 2; // demo threshold

    constructor(address[] memory _voters) {
        for (uint i = 0; i < _voters.length; i++) {
            voters[_voters[i]] = true;
        }
    }

    function voteApprove(uint256 appraisalId) external {
        require(voters[msg.sender], "Not DAO voter");
        require(!approved[appraisalId], "Already approved");

        yesVotes[appraisalId]++;

        if (yesVotes[appraisalId] >= voteThreshold) {
            approved[appraisalId] = true;
        }
    }

    function isApproved(uint256 appraisalId) external view returns (bool) {
        return approved[appraisalId];
    }
}

