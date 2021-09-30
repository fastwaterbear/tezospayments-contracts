#include "../common/validation.religo"

[@inline] let fail_if_service_is_not_initialized = (storage: storage) => if (!storage.initialized) { failwith(errors_service_is_not_initialized); };

[@inline] let fail_if_service_is_paused = (storage: storage) => if (storage.paused) { failwith(errors_service_is_paused); };

[@inline] let fail_if_service_is_deleted = (storage: storage) => if (storage.deleted) { failwith(errors_service_is_deleted); };

[@inline] let fail_if_payload_is_invalid = (payload: payment_payload) => switch (payload) {
    | Public(_) => unit;
    | Private(_) => failwith(errors_private_payload_not_supported);
    | Public_and_private(_, _) => failwith(errors_private_payload_not_supported);
};

[@inline] let fail_if_payment_operation_type_is_invalid = ((operation_type, allowed_operation_type): (operation_type, operation_type)) => {
    fail_if_operation_type_is_invalid(operation_type);

    // The first condition: check a value of the operation_type is a single value
    //      We've checked that operation_type is not equal to 0 in the fail_if_operation_type_is_invalid function above
    //      so we can skip to check for 0
    // The second condition: check the value of the operation_type is allowed
    if (Bitwise.and(operation_type, abs(operation_type - 1n)) != 0n
        || Bitwise.and(operation_type, allowed_operation_type) != operation_type) {
        failwith(errors_invalid_operation_type);
    };
}

[@inline] let fail_if_no_allowed_tokens = (service_parameters: service_parameters) => {
    if (!service_parameters.allowed_tokens.tez && Set.size(service_parameters.allowed_tokens.assets) == 0n) {
        failwith(errors_no_allowed_tokens);
    }
};

[@inline] let fail_if_service_parameters_are_invalid = (service_parameters: service_parameters) => {
    fail_if_no_allowed_tokens(service_parameters);
    fail_if_operation_type_is_invalid(service_parameters.allowed_operation_type);
    Map.iter(((_, signing_key): (key, signing_key)) => fail_if_signing_key_is_invalid(signing_key), service_parameters.signing_keys);
};