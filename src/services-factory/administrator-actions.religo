#include "../common/constants.religo"
#include "./types.religo"
#include "./errors.religo"

let get_factory_implementation_set_enabled_entrypoint = (
    factory_implementation: factory_implementation
): contract(factory_implementation_parameters) => 
    switch (Tezos.get_entrypoint_opt("%set_disabled", factory_implementation): option(contract(factory_implementation_parameters))) {
        | Some(contract) => contract;
        | None => failwith(errors_invalid_factory_implementation)
    };

let set_administrator = ((new_administrator, storage): (address, storage)): main_result => {
    (
        ([]: list(operation)),
        {   ...storage, administrator: new_administrator }
    )
};

let set_pause = ((paused, storage): (bool, storage)): main_result => {
    (
        ([]: list(operation)),
        {   ...storage, paused: paused }
    )
};

let set_factory_implementation = ((new_factory_implementation, storage): (factory_implementation, storage)): main_result => {
    let factory_implementation_version = storage.factory_implementation_version + 1n;
    let launch_new_factory_implementation_operation = Tezos.transaction(
        (false, Some(factory_implementation_version)), 
        0tez, 
        get_factory_implementation_set_enabled_entrypoint(new_factory_implementation)
    );

    let operations = if (storage.factory_implementation != constant_burn_address) {
        [
            launch_new_factory_implementation_operation, 
            Tezos.transaction(
                (true, (None: option(nat))),
                0tez,
                get_factory_implementation_set_enabled_entrypoint(storage.factory_implementation)
            )
        ]
    } else {
        [launch_new_factory_implementation_operation];
    };

    (
        operations,
        {
            ...storage,
            factory_implementation: new_factory_implementation,
            factory_implementation_version: factory_implementation_version
        }
    )
};

let administrator_main = ((action, storage): (administrator_action, storage)): main_result => {
    if (storage.administrator != Tezos.sender) {
        failwith(errors_not_administrator);
    };

    switch (action) {
        | Set_administrator(new_administrator) => set_administrator(new_administrator, storage);
        | Set_pause(paused) => set_pause(paused, storage);
        | Set_factory_implementation(new_factory_implementation) => set_factory_implementation(new_factory_implementation, storage);
    }
}
