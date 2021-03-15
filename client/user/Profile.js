import React, { useState, useEffect } from 'react'
import auth from './../auth/auth-helper'
import { makeStyles } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import List from'@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import {read} from './api-user'
import Edit from '@material-ui/icons/Edit'
import Person from '@material-ui/icons/Person'
import { Link, Redirect } from 'react-router-dom'
import DeleteUser from './DeleteUser'

const useStyles = makeStyles(theme => ({
    root: theme.mixins.gutters({
        maxWidth: 600,
        margin: 'auto',
        marginTop: theme.spacing(5),
        padding: theme.spacing(3)
    }),
    title:{
        marginTop: theme.spacing(2),
        color: theme.palette.protectedTitle
    }
}))

export default function Profile({ match }) {
    
    const classes = useStyles()
    const [user, setUser] = useState({})
    const [redirectToSignin, setRedirectToSignin] = useState(false)


    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal
        const jwt = auth.isAuthenticated()
        read({
            userId: match.params.userId
        }, {t: jwt.token}, signal).then((data) => {
            if (data && data.error) {
                setRedirectToSignin(true)
            } else {
                setUser(data)
            }
        })
        return function cleanup() {
            abortController.abort()
        }
    }, [match.params.userId])

    if (redirectToSignin) {
        return <Redirect to="/signin/" />
    }

    return (
        <Paper className={classes.root} elevation={4} >
            <Typography variant="h6" className={classes.title} >
                Profile
            </Typography>
            <List dense>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar>
                            <Person />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={user.name}
                                secondary={user.email}
                    />
                    { auth.isAuthenticated().user &&
                        auth.isAuthenticated().user._id == user._id &&
                        (<ListItemSecondaryAction>
                            <Link to={"/user/edit/" + user._id}>
                                <IconButton aria-label="Edit" color="primary">
                                    <Edit />
                                </IconButton>
                            </Link>
                            <DeleteUser userId={user._id} />
                        </ListItemSecondaryAction>)
                    }
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText primary={"Joined: " + (new Date(user.created)).toDateString()} />
                </ListItem>
            </List>
        </Paper>
    )
}