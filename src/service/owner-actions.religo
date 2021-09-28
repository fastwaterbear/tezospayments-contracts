#include "./types.religo"
#include "./errors.religo"
#include "./validation.religo"

let initialize = ((service_parameters, storage): (service_parameters, storage)): main_result => {
    fail_if_service_parameters_are_invalid(service_parameters);

    (
        ([]: list(operation)),
        { 
            ...storage,
            metadata: service_parameters.metadata,
            allowed_tokens: service_parameters.allowed_tokens,
            allowed_operation_type: service_parameters.allowed_operation_type,
            signing_keys: service_parameters.signing_keys,
            paused: false,
            deleted: false,
            initialized: true
        }
    )
}

let set_owner = ((new_owner, storage): (address, storage)): main_result => {
    (
        ([]: list(operation)),
        { ...storage, owner: new_owner }
    )
};

let set_pause = ((paused, storage): (bool, storage)): main_result => {
    (
        ([]: list(operation)),
        { ...storage, paused: paused }
    )
};

let set_deleted = ((deleted, storage): (bool, storage)): main_result => {
    (
        ([]: list(operation)),
        { ...storage, deleted: deleted }
    )
};

let update_service_parameters = ((service_parameters, storage): (service_parameter_updates, storage)): main_result => {
    (switch service_parameters {
        | { 
            metadata: None,
            allowed_tokens: { tez: None, assets: None },
            allowed_operation_type: None
          } => (failwith(errors_empty_update): unit)
        | _ => unit
    });

    let updated_storage_step1 = switch service_parameters.metadata {
        | Some(new_metadata) => { ...storage, metadata: new_metadata }
        | None => storage
    };
    let updated_storage_step2 = switch service_parameters.allowed_tokens.tez {
        | Some(new_tez)
            => { ...updated_storage_step1, allowed_tokens: { ...updated_storage_step1.allowed_tokens, tez: new_tez } }
        | None => updated_storage_step1
    };
    let updated_storage_step3 = switch service_parameters.allowed_tokens.assets {
        | Some(new_assets)
            => { ...updated_storage_step2, allowed_tokens: { ...updated_storage_step2.allowed_tokens, assets: new_assets } }
        | None => updated_storage_step2
    };
    let updated_storage_step4 = switch service_parameters.allowed_operation_type {
        | Some(new_allowed_operation_type) => {
            fail_if_operation_type_is_invalid(new_allowed_operation_type);

            { ...updated_storage_step3, allowed_operation_type: new_allowed_operation_type }
          }
        | None => updated_storage_step3
    };

    (([]: list(operation)), updated_storage_step4)
};

let update_signing_keys = ((signing_key_updates, storage): (signing_key_updates, storage)): main_result => {
    let update_signing_keys = Map.fold(
        (updated_map, signing_key_update: (signing_keys, (key, option(signing_key)))) => Map.update(signing_key_update[0], signing_key_update[1], updated_map),
        signing_key_updates,
        storage.signing_keys
    );

    (
        ([]: list(operation)), 
        { ...storage, signing_keys: update_signing_keys }
    )
};

[@inline] let fail_if_caller_is_not_owner = (storage: storage) => if (storage.owner != Tezos.sender) { failwith(errors_not_owner); };

[@inline] let fail_if_service_is_not_initialized_or_trying_initialize_twice = ((action, storage): (owner_action, storage)) => switch (action) {
    | Initialize(_) => if (storage.initialized) { failwith(errors_service_is_already_initialized); };
    | _ => fail_if_service_is_not_initialized(storage);
}

let owner_main = ((action, storage): (owner_action, storage)): main_result => {
    fail_if_caller_is_not_owner(storage);
    fail_if_service_is_not_initialized_or_trying_initialize_twice(action, storage);

    switch (action) {
        | Initialize(service_parameters) => initialize(service_parameters, storage);
        | Set_owner(new_owner) => set_owner(new_owner, storage);
        | Set_pause(paused) => set_pause(paused, storage);
        | Set_deleted(deleted) => set_deleted(deleted, storage);
        | Update_service_parameters(service_parameters) => update_service_parameters(service_parameters, storage);
        | Update_signing_keys(signing_keys) => update_signing_keys(signing_keys, storage);
    }
}
