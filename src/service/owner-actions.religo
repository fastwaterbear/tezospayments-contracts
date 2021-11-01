#include "./types.religo"
#include "./errors.religo"
#include "./validation.religo"

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

    let updated_storage = switch service_parameters.metadata {
        | Some(new_metadata) => { ...storage, metadata: new_metadata }
        | None => storage
    };
    let updated_storage = switch service_parameters.allowed_tokens.tez {
        | Some(new_tez)
            => { ...updated_storage, allowed_tokens.tez: new_tez }
        | None => updated_storage
    };
    let updated_storage = switch service_parameters.allowed_tokens.assets {
        | Some(new_assets)
            => { ...updated_storage, allowed_tokens.assets: new_assets }
        | None => updated_storage
    };
    let updated_storage = switch service_parameters.allowed_operation_type {
        | Some(new_allowed_operation_type) => {
            fail_if_operation_type_is_invalid(new_allowed_operation_type);

            { ...updated_storage, allowed_operation_type: new_allowed_operation_type }
          }
        | None => updated_storage
    };

    (([]: list(operation)), updated_storage)
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

let owner_main = ((action, storage): (owner_action, storage)): main_result => {
    fail_if_caller_is_not_owner(storage);

    switch (action) {
        | Set_owner(new_owner) => set_owner(new_owner, storage);
        | Set_pause(paused) => set_pause(paused, storage);
        | Set_deleted(deleted) => set_deleted(deleted, storage);
        | Update_service_parameters(service_parameters) => update_service_parameters(service_parameters, storage);
        | Update_signing_keys(signing_keys) => update_signing_keys(signing_keys, storage);
    }
}
