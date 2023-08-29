[![codecov](https://codecov.io/gh/jbothma/ocds_data_summary/branch/master/graph/badge.svg)](https://codecov.io/gh/jbothma/ocds_data_summary/)
[![Build Status](https://travis-ci.org/jbothma/ocds_data_summary.png)](https://travis-ci.org/jbothma/ocds_data_summary)

OCDS data summary
===============================

This is the backend for the Vulekamali and OCPO OCDS data availability summary.

It fetches data from the OCPO OCDS API, and produces a summary of the available OCDS data
which can be accessed via its API.


Project Layout
--------------

### Docker

On Linux, you probably want to set the environment variables `USER_ID=$(id -u)`
and `GROUP_ID=$(id -g)` where you run docker-compose so that the container
shares your UID and GID. This is important for the container to have permission
to modify files owned by your host user (e.g. for python-black) and your host
user to modify files created by the container (e.g. migrations).


### Django

Apps go in the project directory `ocds_data_summary`


### Python

Dependencies are managed via poetry in the docker container.

Add and lock dependencies in a temporary container:

    docker-compose run --rm -u0 web poetry add pkgname==1.2.3

Rebuild the image to contain the new dependencies:

    docker-compose build web

Make sure to commit updates to pyproject.toml and poetry.lock to git


Development setup
-----------------

In another shell, initialise and run the django app

    docker-compose run --rm web bin/wait-for-postgres.sh
    docker-compose run --rm web python manage.py migrate
    docker-compose up

This will start the web and app containers. The web container automatically reloads
Python code changes. The worker app does not, and has to be restarted for it to run
the modified code.

If you need to destroy and recreate your dev setup, e.g. if you've messed up your
database data or want to switch to a branch with an incompatible database schema,
you can destroy all volumes and recreate them by running the following, and running
the above again:

    docker-compose down --volumes


Running tests
-------------

    docker-compose run --rm web python manage.py test

Tests might fail to connect to the databse if the docker-compose `db` service wasn't running and configured yet. Just check the logs for the `db` service and run the tests again.


Settings
--------

Undefined settings result in exceptions at startup to let you know they are not configured properly. It's one this way so that the defaults don't accidentally let bad things happen like forgetting analytics or connecting to the prod DB in development.


| Key | Default | Type | Description |
|-----|---------|------|-------------|
| `DATABASE_URL` | undefined | String | `postgresql://user:password@hostname/dbname` style URL |
| `DJANGO_DEBUG_TOOLBAR` | False | Boolean | Set to `True` to enable the Django Debug toolbar NOT ON A PUBLIC SERVER! |
| `DJANGO_SECRET_KEY` | undefined | String | Set this to something secret and unguessable in production. The security of your cookies and other crypto stuff in django depends on it. |
| `TAG_MANAGER_CONTAINER_ID` | undefined | String | [Google Tag Manager](tagmanager.google.com) Container ID. [Use this to set up Google Analytics.](https://support.google.com/tagmanager/answer/6107124?hl=en). Requried unless `TAG_MANAGER_ENABLED` is set to `False` |
| `TAG_MANAGER_ENABLED` | `True` | Boolean | Use this to disable the Tag Manager snippets, e.g. in dev or sandbox. |