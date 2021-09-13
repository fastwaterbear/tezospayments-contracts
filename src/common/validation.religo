#include "./types.religo"
#include "./constants.religo"
#include "./errors.religo"

[@inline] let fail_if_operation_type_is_invalid = (operation_type: operation_type) => 
    if (operation_type == 0n || Bitwise.or(operation_type, constant_all_operation_type) != constant_all_operation_type) { 
        failwith(errors_invalid_operation_type);
    };

[@inline] let fail_if_signing_key_is_invalid = (signing_key: signing_key) =>
    switch signing_key[1] {
        | Some(signing_key_name) => 
            if (String.length(signing_key_name) < constant_min_signing_key_name_length || String.length(signing_key_name) > constant_max_signing_key_name_length) {
                failwith(errors_invalid_signing_key);
            }
        | None => unit;
    }
