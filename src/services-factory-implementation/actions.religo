#include "./types.religo"
#include "./errors.religo"
#include "./validation.religo"

let get_factory_add_service_entrypoint = (factory: address): contract(add_service_factory_parameters) => 
    switch (Tezos.get_entrypoint_opt("%add_service", factory): option(contract(add_service_factory_parameters))) {
        | Some(contract) => contract;
        | None => failwith(errors_invalid_factory)
    };

let create_service_internal = [%Michelson ({| {
    UNPPAIIR ;
    CREATE_CONTRACT
#include "../../build/michelson/service.tz"
    ;
    PAIR
} |}: ((option(key_hash), tez, service_storage) => (operation, service)))];

let create_service = ((service_parameters, storage): (service_parameters, storage)): main_result => {
    fail_if_factory_implementation_is_disabled(storage);
    fail_if_service_parameters_are_invalid(service_parameters);

    let (create_service_operation, service) = create_service_internal(
        (None: option(key_hash)),
        0tez,
        {
            version: storage.version,
            metadata: service_parameters.metadata,
            allowed_tokens: service_parameters.allowed_tokens,
            signing_keys: service_parameters.signing_keys,
            completed_payments: (Big_map.empty: completed_payments),
            owner: Tezos.sender,
            paused: false,
            deleted: false,
        }
    );

    let factory_contract = get_factory_add_service_entrypoint(storage.factory);
    let add_service_operation = Tezos.transaction(
        { service: service, owner: Tezos.sender },
        0tez,
        factory_contract
    );

    (
        [create_service_operation, add_service_operation],
        storage
    )
};

let set_disabled = ((disabled, version, storage): (bool, option(service_version), storage)): main_result => {
    fail_if_caller_is_not_factory(storage);
    
    let new_version = switch (version) {
        | Some(v) => if (!disabled) { v; } else { (failwith(errors_version_should_be_defined): nat); };
        | None => if (disabled) { storage.version; } else { (failwith(errors_version_is_excess_parameter): nat); };
    };

    (
        ([]: list(operation)),
        {
            ...storage,
            disabled: disabled,
            version: new_version
        }
    )
}
