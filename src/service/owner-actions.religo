#include "./types.religo"
#include "./errors.religo"

[@inline] let fail_if_operation_types_set_is_empty = (operation_types: set(operation_type))
    => if (Set.size(operation_types) == 0n) { failwith(errors_empty_payment_types_set); };

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

let update_service_parameters = ((service_parameters, storage): (service_parameters_updates, storage)): main_result => {
    (switch service_parameters {
        | { 
            metadata: None,
            allowed_tokens: { tez: None, assets: None },
            allowed_operation_types: None
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
    let updated_storage_step4 = switch service_parameters.allowed_operation_types {
        | Some(new_allowed_operation_types) => {
            fail_if_operation_types_set_is_empty(new_allowed_operation_types);

            { ...updated_storage_step3, allowed_operation_types: new_allowed_operation_types }
          }
        | None => updated_storage_step3
    };

    (([]: list(operation)), updated_storage_step4)
};

let owner_main = ((action, storage): (owner_action, storage)): main_result => {
    if (storage.owner != Tezos.sender) {
        failwith(errors_not_owner);
    };

    switch (action) {
        | Set_owner(new_owner) => set_owner(new_owner, storage);
        | Set_pause(paused) => set_pause(paused, storage);
        | Set_deleted(deleted) => set_deleted(deleted, storage);
        | Update_service_parameters(service_parameters) => update_service_parameters(service_parameters, storage);
    }
}
