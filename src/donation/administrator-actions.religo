#include "../common/errors.religo"
#include "./types.religo"

let set_administrator = ((new_administrator, storage): (address, storage)): main_result => {
    (
        ([]: list(operation)),
        {   ...storage, administrator: new_administrator }
    )
};

let confirm_administrator = (storage: storage): main_result => {
    (
        ([]: list(operation)),
        storage
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
        | Confirm_administrator => confirm_administrator(storage);
        | Set_disabled(disabled) => set_disabled(disabled, storage);
    }
}
