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

let get_fa12_transfer_entrypoint = (contract: address): contract(transfer_fa12_parameters) => 
    switch (Tezos.get_entrypoint_opt("%transfer", contract): option(contract(transfer_fa12_parameters))) {
        | Some(contract) => contract;
        | None => failwith(errors_not_fa12_contract)
    };

let transfer_asset = ((asset_value, storage): (asset_value, storage)): main_result => {
    if (Tezos.amount > 0tez) {
        failwith(errors_invalid_amount);
    };

    let entrypoint = get_fa12_transfer_entrypoint(asset_value.token_address);
    (
        [Tezos.transaction({ from: Tezos.sender, to: storage.owner, value: asset_value.value }, 0mutez, entrypoint)],
        storage  
    );
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
