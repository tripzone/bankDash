FROM python
COPY *.py /
COPY ./requirements.txt /
WORKDIR /
RUN mkdir temp
RUN pip install --upgrade pip
RUN pip install numpy --upgrade
RUN pip install --upgrade setuptools
RUN pip install -r requirements.txt
RUN pip install --upgrade google-cloud-storage
ENTRYPOINT ["python", "server.py"]
