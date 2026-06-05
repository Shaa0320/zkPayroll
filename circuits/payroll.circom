pragma circom 2.0.0;

template Payroll() {
    signal input gross;
    signal input tax;
    signal input net;
    signal output totalNet;

    // Constraint: net must equal gross - tax
    net === gross - tax;

    // Output totalNet = net
    totalNet <== net;
}

component main = Payroll();

