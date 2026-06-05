pragma circom 2.2.2;

include "circomlib/circuits/comparators.circom";

template ZKPayroll() {
    signal input age;
    signal input salary;
    signal input citizenship;
    signal input isEmployee;
    signal input isVerified;

    signal output valid;

    // Check age < 18
    component ageCheck = LessThan(8);
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== 18;

    // Intermediate signals (to keep constraints quadratic)
    signal ageOk;
    signal temp;

    ageOk <== 1 - ageCheck.out;   // age >= 18
    temp  <== ageOk * isEmployee; // one multiplication
    valid <== temp * isVerified;  // one multiplication
}

component main = ZKPayroll();
