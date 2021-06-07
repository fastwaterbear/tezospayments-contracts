#include "./types.religo"
#include "./errors.religo"
#include "./owner-actions.religo"

let main = ((action, storage): (action, storage)): main_result => 
    switch (action) {
        | AcceptPayment => (failwith(errors_not_implemented): main_result)
        | Owner_action(owner_action) => owner_main(owner_action, storage);
    };
