#include "./types.religo"
#include "./errors.religo"

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

let set_service_factory_function = ((new_service_factory_function, storage): (service_factory_function, storage)): main_result => {
    (
        ([]: list(operation)),
        {   ...storage, service_factory_function: new_service_factory_function }
    )
};

let administrator_main = ((action, storage): (administrator_action, storage)): main_result => {
    if (storage.administrator != Tezos.sender) {
        failwith(errors_not_administrator);
    };

    switch (action) {
        | Set_administrator(new_administrator) => set_administrator(new_administrator, storage);
        | Set_pause(paused) => set_pause(paused, storage);
        | Set_service_factory_function(new_service_factory_function) => set_service_factory_function(new_service_factory_function, storage);
    }
}
