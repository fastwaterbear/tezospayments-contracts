#include "./types.religo"
#include "./errors.religo"

let main = ((action, _storage): (action, storage)): main_result => 
    switch (action) {
        | Owner_action(_owner_action) => (([]: list(operation)), (failwith(errors_not_owner): storage));
    };
