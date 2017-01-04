# DB Direct Samples

    $ mongo

이름 변경

    db.users.find({ homel : 'admin'})
    db.users.update({ _id: 18060 }, { $set : { name: '...', namel: '...' }})

계정 복구

    db.users.find({ namel: '...' })
    db.users.update({ namel: '...' }, { $set : { status: 'v' }})

    디비 수정하고 웹 페이지에서 Profile Update 한번 해야한다.
