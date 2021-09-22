#include "./types.religo"
#include "./actions.religo"
#include "./administrator-actions.religo"

let main = ((action, storage): (action, storage)): main_result =>
    switch (action) {
        | Create_service => create_service(storage);
        | Administrator_action(administrator_action) => administrator_main(administrator_action, storage);
    };
