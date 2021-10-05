#include "./validation.religo"

let get_owner_account = (owner: address): contract(unit)
    => switch (Tezos.get_contract_opt(owner): option(contract(unit))) {
        | Some(contract) => contract;
        | None => (failwith(errors_invalid_address) : contract(unit));
    };

let transfer_tez = (storage: storage): main_result => {
    if (Tezos.amount <= 0tez) {
        failwith(errors_invalid_amount);
    };

    let owner_account = get_owner_account(storage.owner);

    (
        [Tezos.transaction(unit, Tezos.amount, owner_account)],
        storage
    );
};

let transfer_asset = ((_asset_value, _storage): (asset_value, storage)): main_result => {
    if (Tezos.amount > 0tez) {
        failwith(errors_invalid_amount);
    };

    (failwith(errors_not_implemented): main_result);
};

let send_payment = (
    (asset_value, operation_type, payload, storage): (option(asset_value), operation_type, payment_payload, storage)
): main_result => {
    fail_if_service_is_paused(storage);
    fail_if_service_is_deleted(storage);
    fail_if_payment_operation_type_is_invalid(operation_type, storage.allowed_operation_type);
    fail_if_payload_is_invalid(payload);

    switch asset_value {
        | None => transfer_tez(storage)
        | Some(asset_value) => transfer_asset(asset_value, storage)
    };
};
