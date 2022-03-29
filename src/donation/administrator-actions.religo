#include "../common/errors.religo"
#include "./types.religo"

let set_administrator = ((new_administrator, storage): (option(address), storage)): main_result => {
    (
        ([]: list(operation)),
        {   ...storage, pending_administrator: new_administrator }
    )
};

let set_disabled = ((disabled, storage): (bool, storage)): main_result => {
    (
        ([]: list(operation)),
        {   ...storage, disabled: disabled }
    )
};

let administrator_main = ((action, storage): (administrator_action, storage)): main_result => {
    if (storage.administrator != Tezos.sender) {
        failwith(errors_not_administrator);
    };

    switch (action) {
        | Set_administrator(new_administrator) => set_administrator(new_administrator, storage);
        | Set_disabled(disabled) => set_disabled(disabled, storage);
    }
}
