import {useState} from 'react';
export default function EditView({initialContent}:{initialContent:string}){
	const [content, setContent]=useState(initialContent);
}