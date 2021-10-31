#include "./validation.religo"

let get_owner_account = (owner: address): contract(unit)
    => switch (Tezos.get_contract_opt(owner): option(contract(unit))) {
        | Some(contract) => contract;
        | None => (failwith(errors_invalid_address) : contract(unit));
    };

let transfer_tez = (storage: storage): main_result => {
    if(!storage.allowed_tokens.tez) {
        failwith(errors_not_allowed_token);
    };

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
        | None => failwith(errors_not_fa12_contract);
    };

let transfer_fa12_asset = ((asset_value, storage): (asset_value, storage)): main_result => {
    let entrypoint = get_fa12_transfer_entrypoint(asset_value.token_address);
    (
        [Tezos.transaction({ from: Tezos.sender, to: storage.owner, value: asset_value.value }, 0tz, entrypoint)],
        storage  
    );
};

let get_fa20_transfer_entrypoint = (contract: address): contract(transfer_fa20_parameters) => 
    switch (Tezos.get_entrypoint_opt("%transfer", contract): option(contract(transfer_fa20_parameters))) {
        | Some(contract) => contract;
        | None => failwith(errors_not_fa20_contract);
    };

let transfer_fa20_asset = ((asset_value, storage): (asset_value, storage)): main_result => {
    let token_id = switch (asset_value.token_id: option(nat)) {
        | Some (id) => id;
        | None => (failwith (errors_invalid_token_id): nat);
    };

    let entrypoint = get_fa20_transfer_entrypoint(asset_value.token_address);
    let transfer_params = [{ from_: Tezos.sender, txs: [{ to_: storage.owner, token_id: token_id, amount: asset_value.value }] }];
    (
        [Tezos.transaction(transfer_params, 0tz, entrypoint)],
        storage  
    );
};

let transfer_asset = ((asset_value, storage): (asset_value, storage)): main_result => {
    if(!Set.mem(asset_value.token_address, storage.allowed_tokens.assets)) {
        failwith(errors_not_allowed_token);
    };

    if (Tezos.amount > 0tez || asset_value.value <= 0n) {
        failwith(errors_invalid_amount);
    };

    switch(asset_value.token_id: option(nat)) {
        | None => transfer_fa12_asset(asset_value, storage);
        | Some(_id) => transfer_fa20_asset(asset_value, storage);
    };
};

let send_payment = (
    (asset_value, operation_type, payload, storage): (option(asset_value), operation_type, payment_payload, storage)
): main_result => {
    fail_if_service_is_paused(storage);
    fail_if_service_is_deleted(storage);
    fail_if_payment_operation_type_is_invalid(operation_type, storage.allowed_operation_type);
    fail_if_payload_is_invalid(payload);

    switch asset_value {
        | None => transfer_tez(storage);
        | Some(asset_value) => transfer_asset(asset_value, storage);
    };
};
