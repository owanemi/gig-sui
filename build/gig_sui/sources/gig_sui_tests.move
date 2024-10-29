
#[test_only]
module gig_sui::gig_sui_tests;
// uncomment this line to import the module
// use gig_sui::gig_sui;

const ENotImplemented: u64 = 0;

#[test]
fun test_gig_sui() {
    // pass
}

#[test, expected_failure(abort_code = ::gig_sui::gig_sui_tests::ENotImplemented)]
fun test_gig_sui_fail() {
    abort ENotImplemented
}

