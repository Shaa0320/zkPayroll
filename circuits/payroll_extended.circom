pragma circom 2.1.0;

include "circomlib/circuits/comparators.circom";

/*
  Extended zkPayroll Circuit
  Models complex workforce eligibility using multiple policy dimensions
*/

template PayrollExtended() {

    // --- INPUTS ---
    signal input status;          // 1 = Active, 0 = Inactive
    signal input score;           // Performance score (0–5)
    signal input tenure;          // Years in organization
    signal input attendance;      // Attendance percentage (0–100)
    signal input disciplinary;    // 0 = Clean, 1 = Has issue
    signal input role;            // 1=Junior, 2=Senior, 3=Manager
    signal input department;      // Encoded department ID
    signal input appraisalYear;   // Appraisal year

    // --- OUTPUT ---
    signal output eligible;

    // --- BASIC CHECKS ---
    component isActive = IsEqual();
    isActive.in[0] <== status;
    isActive.in[1] <== 1;

    component scoreCheck = GreaterEqThan(3);
    scoreCheck.in[0] <== score;
    scoreCheck.in[1] <== 4;

    component tenureCheck = GreaterEqThan(3);
    tenureCheck.in[0] <== tenure;
    tenureCheck.in[1] <== 2;

    component attendanceCheck = GreaterEqThan(7);
    attendanceCheck.in[0] <== attendance;
    attendanceCheck.in[1] <== 90;

    component cleanRecord = IsEqual();
    cleanRecord.in[0] <== disciplinary;
    cleanRecord.in[1] <== 0;

    // --- ROLE CHECKS ---
    component isJunior = IsEqual();
    isJunior.in[0] <== role;
    isJunior.in[1] <== 1;

    component isSenior = IsEqual();
    isSenior.in[0] <== role;
    isSenior.in[1] <== 2;

    component isManager = IsEqual();
    isManager.in[0] <== role;
    isManager.in[1] <== 3;

    // --- POLICY LOGIC (QUADRATIC SAFE) ---

    // Junior: active + score + tenure
    signal juniorTmp1;
    signal juniorTmp2;
    signal juniorEligible;

    juniorTmp1 <== isActive.out * scoreCheck.out;
    juniorTmp2 <== juniorTmp1 * tenureCheck.out;
    juniorEligible <== juniorTmp2 * isJunior.out;

    // Senior: active + score + tenure + attendance
    signal seniorTmp1;
    signal seniorTmp2;
    signal seniorTmp3;
    signal seniorEligible;

    seniorTmp1 <== isActive.out * scoreCheck.out;
    seniorTmp2 <== seniorTmp1 * tenureCheck.out;
    seniorTmp3 <== seniorTmp2 * attendanceCheck.out;
    seniorEligible <== seniorTmp3 * isSenior.out;

    // Manager: active + tenure + clean record
    signal managerTmp1;
    signal managerTmp2;
    signal managerEligible;

    managerTmp1 <== isActive.out * tenureCheck.out;
    managerTmp2 <== managerTmp1 * cleanRecord.out;
    managerEligible <== managerTmp2 * isManager.out;

    // --- FINAL ELIGIBILITY ---
    eligible <== juniorEligible + seniorEligible + managerEligible;
}

component main = PayrollExtended();
