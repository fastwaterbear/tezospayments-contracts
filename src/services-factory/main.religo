#include "./types.religo"
#include "./actions.religo"
#include "./administrator-actions.religo"

let main = ((action, storage): (action, storage)): main_result =>
    switch (action) {
        | Add_service(service_info) => add_service(service_info, storage);
        | Administrator_action(administrator_action) => administrator_main(administrator_action, storage);
    };
