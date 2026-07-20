# data tools
import os
import numpy as np
from plot_fig import plot_history
from sklearn.metrics import classification_report

from tensorflow.keras.backend import clear_session
from tensorflow.keras.datasets import cifar10
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input 
from tensorflow.keras.layers import Rescaling
from tensorflow.keras.layers import (Conv2D, 
                                     MaxPool2D, 
                                     Activation, 
                                     Flatten, 
                                     Dense,
                                     Dropout, 
                                     BatchNormalization)
                                
from tensorflow.keras.optimizers import SGD
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.data import AUTOTUNE
from tensorflow.keras.applications.vgg16 import (preprocess_input,
                                                 decode_predictions,
                                                 VGG16)
from tensorflow.keras.models import Model
                                                                              

# setting up paths
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "in")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "out")
FIG_DIR = os.path.join(OUTPUT_DIR, "fig")

# this function defines the VGG16 model layer by layer. Only the convolutional layers of the model are used to fit it with the data. For this task, the model's layers are also frozen.
def define_model():

    model = VGG16(include_top=False, 
                pooling='avg',
                input_shape=(224, 224, 3))

    for layer in model.layers:
        layer.trainable = False
        
    flat1 = Flatten()(model.output)
    class1 = Dense(128, 
                activation='relu')(flat1)
    batchnorm = BatchNormalization()(class1)
    output = Dense(20, 
                activation='softmax')(batchnorm)

    model = Model(inputs=model.inputs, 
                outputs=output)


    return model

# this function fits the model defined by the define_model() function on the data. The model runs for 5 epochs. The fit for each epoch is tested on the validation data.
def run_model(data, val_data, plot_path):
    model = define_model()
    model.compile(optimizer="sgd",
                loss='categorical_crossentropy',
                metrics=['accuracy'])

    H = model.fit(data,
              validation_data=val_data, 
              shuffle=True,
              epochs=5,
              verbose=1)
    
    plot_history(H, 5, plot_path)
    return model


# this function test the model trained in the run_model() function on the test data. The results are then saved and the model is cleared from the session.
def test_model(test_data, model, labels, report_path):
    y_true_all = []
    y_pred_all = []

    for x_batch, y_batch in test_data:
        preds = model(x_batch, training=False)

        y_true_all.extend(y_batch.numpy().argmax(axis=1))
        y_pred_all.extend(preds.numpy().argmax(axis=1))

    report = classification_report(
        y_true_all,
        y_pred_all,
        target_names=labels
    )
    with open(os.path.join(OUTPUT_DIR, report_path), "w") as file:
            file.write(report)
    
    del model
    clear_session()

# this function runs the whole pipline
def run_pipline_vgg16(data, test_data, val_data, labels, plot_path, report_path):
    model = run_model(data, val_data, plot_path)
    test_model(test_data, model, labels, report_path)

if __name__ == "__main__":
    run_pipline_vgg16()





    