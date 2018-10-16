from google.cloud import storage
from io import BytesIO, StringIO
import json
bucket_name="bankdash22"

def upload_blob(df, destination_blob_name, header=False):
    global bucket_name
    """Uploads a file to the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    dfString = df.to_csv(index=False, header=header)
    towrite = StringIO(dfString)
    blob.upload_from_file(towrite)
    print('File uploaded to {}.'.format(destination_blob_name))

def upload_json(io, destination_blob_name):
    global bucket_name
    """Uploads a file to the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_file(io, rewind=True)
    print('File uploaded to {}.'.format(destination_blob_name))

def download_blob(source_blob_name):
    global bucket_name
    """Downloads a blob from the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(source_blob_name)
    downloaded =  blob.download_as_string()
    response = BytesIO(downloaded)
    return response
    print('Blob {} downloaded .'.format(source_blob_name))


# download_blob("data/data.csv", "dt1.csv")