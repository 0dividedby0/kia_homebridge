# pip3 install hyundai-kia-connect-api
# pip3 install python-dateutil
from hyundai_kia_connect_api.VehicleManager import VehicleManager, ClimateRequestOptions

region: int = 3
brand: int = 1
username: str = "username@gmail.com"
password: str = "password"
pin: str = ""
k5id: str = "108426"

vm = VehicleManager(region, brand, username, password, pin)
vm.check_and_refresh_token()
vm.update_all_vehicles_with_cached_state()

vm.lock(k5id)

# climate = ClimateRequestOptions(set_temp=72, duration=10, defrost=True, climate=True, heating=1, front_left_seat=1, front_right_seat=1)
# vm.start_climate(k5id, climate)