#include "../common/errors.religo"

let confirm_administrator = (storage: storage): main_result => {
    let pending_administrator = switch (storage.pending_administrator) {
        | Some(v) => if (v == Tezos.sender) { v; } else { (failwith(errors_not_pending_administrator): address); };
        | None => (failwith(errors_not_pending_administrator): address);
    };

    (
        ([]: list(operation)),
        {   
            ...storage, 
            administrator: pending_administrator, 
            pending_administrator: (None: option(address)) 
        }
    )
};

let send_donation = ((_donation, storage): (donation, storage)): main_result => {
    (
        ([]: list(operation)),
        storage
    )
};
