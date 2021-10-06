[@inline] let constant_payment_operation_type = 1n;
[@inline] let constant_donation_operation_type = 2n;

/*
Bitwise.or(
    constant_payment_operation_type,
    constant_donation_operation_type
);
*/
[@inline] let constant_all_operation_type = 3n;

[@inline] let constant_min_signing_key_name_length = 3n;
[@inline] let constant_max_signing_key_name_length = 30n;
[@inline] let constant_burn_address = ("tz1burnburnburnburnburnburnburjAYjjX": address)
