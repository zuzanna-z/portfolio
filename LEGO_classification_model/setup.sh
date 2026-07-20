sudo apt-get update
sudo apt-get install -y python3-opencv

# create a virtual env
sudo apt install python3-venv
python3 -m venv env

# initialize the virtual env
source ./env/bin/activate

# install requirements
pip install -r requirements.txt


# deactivate the virtual env
deactivate
