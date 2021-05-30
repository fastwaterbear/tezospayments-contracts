#include "./types.religo"
#include "./errors.religo"

let set_administrator = ((_new_administrator, _storage): (address, storage)): main_result => {
    (failwith(errors_not_implemented): main_result);
};

let set_pause = ((_paused, _storage): (bool, storage)): main_result => {
    (failwith(errors_not_implemented): main_result);
};

let set_service_factory_function = ((_new_service_factory_function, _storage): (service_factory_function, storage)): main_result => {
    (failwith(errors_not_implemented): main_result);
};

let administrator_main = ((action, storage): (administrator_action, storage)): main_result => {
    if (storage.administrator != Tezos.sender) {
        failwith(errors_not_administator);
    };

    switch (action) {
        | Set_administrator(new_administrator) => set_administrator(new_administrator, storage);
        | Set_pause(paused) => set_pause(paused, storage);
        | Set_service_factory_function(new_service_factory_function) => set_service_factory_function(new_service_factory_function, storage);
    }
}
