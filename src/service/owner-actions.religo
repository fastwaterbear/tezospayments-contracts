#include "./types.religo"
#include "./errors.religo"

let set_owner = ((new_owner, storage): (address, storage)): main_result => {
    (
        ([]: list(operation)),
        {   ...storage, owner: new_owner }
    )
};

let set_pause = ((paused, storage): (bool, storage)): main_result => {
    (
        ([]: list(operation)),
        {   ...storage, paused: paused }
    )
};

let set_deleted = ((deleted, storage): (bool, storage)): main_result => {
    (
        ([]: list(operation)),
        {   ...storage, deleted: deleted }
    )
};

let update_service_parameters = ((_service_parameters, _storage): (service_parameters_updates, storage)): main_result => {
    failwith(errors_not_implemented);
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
