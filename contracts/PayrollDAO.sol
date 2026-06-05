// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PayrollDAO {
    enum ProposalType { AddEmployee, RemoveEmployee, UpdateSalary, ReleaseFunds }

    struct Employee {
        bool exists;
        uint256 salary;
    }

    struct Proposal {
        ProposalType pType;
        address proposer;
        address target;
        uint256 amount;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 start;
        bool executed;
        mapping(address => bool) voted;
    }

    address public owner;
    mapping(address => bool) public isMember;
    address[] public members;

    mapping(address => Employee) public employees;
    mapping(uint256 => Proposal) private proposals;
    uint256 public proposalCount;
    uint256 public votingDuration = 3 days;

    event MemberAdded(address member);
    event EmployeeAdded(address employee, uint256 salary);
    event ProposalCreated(uint256 id, ProposalType pType);
    event Voted(uint256 id, address voter, bool support);
    event ProposalExecuted(uint256 id, bool success);
    event FundsReleased(address employee, uint256 amount);

    modifier onlyMember() {
        require(isMember[msg.sender], "Only member");
        _;
    }

    constructor(address[] memory initialMembers) {
        owner = msg.sender;
        for (uint i=0;i<initialMembers.length;i++) {
            isMember[initialMembers[i]] = true;
            members.push(initialMembers[i]);
        }
    }

    function createProposal(ProposalType pType, address target, uint256 amount) external onlyMember returns(uint256) {
        uint256 id = proposalCount++;
        Proposal storage p = proposals[id];
        p.pType = pType;
        p.proposer = msg.sender;
        p.target = target;
        p.amount = amount;
        p.start = block.timestamp;
        emit ProposalCreated(id, pType);
        return id;
    }

    function vote(uint256 id, bool support) external onlyMember {
        Proposal storage p = proposals[id];
        require(!p.voted[msg.sender], "Already voted");
        p.voted[msg.sender] = true;
        if (support) p.yesVotes++; else p.noVotes++;
        emit Voted(id, msg.sender, support);
    }

    function executeProposal(uint256 id) external onlyMember {
        Proposal storage p = proposals[id];
        require(!p.executed, "Executed");
        require(p.yesVotes * 2 > members.length, "Not passed");
        p.executed = true;

        bool success = false;

        if (p.pType == ProposalType.AddEmployee) {
            employees[p.target] = Employee(true, p.amount);
            emit EmployeeAdded(p.target, p.amount);
            success = true;
        } 
        else if (p.pType == ProposalType.ReleaseFunds) {
            (bool sent,) = p.target.call{value:p.amount}("");
            require(sent,"Transfer failed");
            emit FundsReleased(p.target, p.amount);
            success = true;
        }
        emit ProposalExecuted(id, success);
    }

    receive() external payable {}
}
