#include "../common/validation.religo"

[@inline] let fail_if_caller_is_not_owner = (storage: storage) => if (storage.owner != Tezos.sender) { failwith(errors_not_owner); };

[@inline] let fail_if_service_is_paused = (storage: storage) => if (storage.paused) { failwith(errors_service_is_paused); };

[@inline] let fail_if_service_is_deleted = (storage: storage) => if (storage.deleted) { failwith(errors_service_is_deleted); };

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

[@inline] let fail_if_payment_signature_is_invalid = ((payment, signing_keys): (payment, signing_keys)) => {
    let get_payment_in_tez_sign_payload = (payment: payment): payment_in_tez_sign_payload => {
        (payment.id, Tezos.self_address, Tezos.amount);
    };
    let get_payment_in_asset_sign_payload = (
        (payment, asset_value): (payment, asset_value)
    ): payment_in_asset_sign_payload => {
        (payment.id, Tezos.self_address, asset_value.value, asset_value.token_address/*, asset_value.token_id*/);
    };
    
    let check_payment_signature = ((payment, key): (payment, key)): bool => {
        let sign_payload_bytes: bytes = switch payment.asset_value {
            | None => Bytes.pack(get_payment_in_tez_sign_payload(payment));
            | Some(asset_value) => Bytes.pack(get_payment_in_asset_sign_payload(payment, asset_value));
        };

        Crypto.check(key, payment.signature, sign_payload_bytes);
    };

    let result = Map.fold(
        ((result, (key, _)): (bool, (key, signing_key))) => {
            if (!result) {
                check_payment_signature(payment, key);
            } else {
                result;
            };
        },
        signing_keys,
        false
    );

    if (!result) {
        failwith(errors_invalid_payment_signature);
    };
}
