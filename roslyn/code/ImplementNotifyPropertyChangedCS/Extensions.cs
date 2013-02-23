using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Roslyn.Compilers;
using Roslyn.Compilers.Common;
using Roslyn.Services;

namespace ImplementNotifyPropertyChangedCS
{
    internal static class Extensions
    {
        public static TSyntaxNode GetAnnotatedNode<TSyntaxNode>(this CommonSyntaxNode node, SyntaxAnnotation annotation)
            where TSyntaxNode : CommonSyntaxNode
        {
            return (TSyntaxNode)node.GetAnnotatedNodesAndTokens(annotation).Single().AsNode();
        }

        public static IEnumerable<TSyntaxNode> GetAnnotatedNodes<TSyntaxNode>(this CommonSyntaxNode node, SyntaxAnnotation annotation)
            where TSyntaxNode : CommonSyntaxNode
        {
            return node.GetAnnotatedNodesAndTokens(annotation).Select(n => n.AsNode()).Cast<TSyntaxNode>();
        }

        public static TSyntaxNode GetAnnotatedNode<TSyntaxNode>(this IDocument document, SyntaxAnnotation annotation)
            where TSyntaxNode : CommonSyntaxNode
        {
            return document.GetSyntaxRoot().GetAnnotatedNode<TSyntaxNode>(annotation);
        }

        public static IEnumerable<TSyntaxNode> GetAnnotatedNodes<TSyntaxNode>(this IDocument document, SyntaxAnnotation annotation)
            where TSyntaxNode : CommonSyntaxNode
        {
            return document.GetSyntaxRoot().GetAnnotatedNodes<TSyntaxNode>(annotation);
        }

        public static INamespaceSymbol FindNamespace(this INamespaceSymbol ns, string name)
        {
            var parts = new Queue<string>(name.Split('.'));
            var currentNamespace = ns;

            while (currentNamespace != null && parts.Count > 0)
            {
                var part = parts.Dequeue();
                currentNamespace = currentNamespace.GetNamespaceMembers().FirstOrDefault(n => StringComparer.Ordinal.Compare(n.Name, part) == 0);
            }

            return currentNamespace;
        }
    }
}
