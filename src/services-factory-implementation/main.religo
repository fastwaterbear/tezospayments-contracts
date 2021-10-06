
#include "./types.religo"
#include "./actions.religo"

let main = ((action, storage): (action, storage)): main_result => {
    switch (action) {
        | Create_service(service_parameters) => create_service(service_parameters, storage);
        | Set_disabled(disabled, version) => set_disabled(disabled, version, storage);
    }
}
