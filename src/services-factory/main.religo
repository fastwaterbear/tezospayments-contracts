#include "./types.religo"
#include "./actions.religo"
#include "./administrator-actions.religo"

let main = ((action, storage): (action, storage)): main_result => 
    switch (action) {
        | Create_service(service_metadata) => create_service(service_metadata, storage);
        | Administrator_action(administrator_action) => administrator_main(administrator_action, storage);
    };
