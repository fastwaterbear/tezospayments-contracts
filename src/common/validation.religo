#include "./types.religo"
#include "./constants.religo"
#include "./errors.religo"

[@inline] let fail_if_signing_key_is_invalid = (signing_key: signing_key) =>
    switch signing_key.name {
        | Some(signing_key_name) => 
            if (String.length(signing_key_name) < constant_min_signing_key_name_length || String.length(signing_key_name) > constant_max_signing_key_name_length) {
                failwith(errors_invalid_signing_key);
            }
        | None => unit;
    }
